"""Read-only bridge to the XAMPP/MySQL database filled by the ESP32.

NOTHING about the hardware table is hard-coded: database and table come from
environment variables, and the columns returned are whatever the table really
contains. The bridge never writes to MySQL.

Defaults match the AirGuard XAMPP setup (database esp32_environment,
table sensor_data, user root with empty password). Override in backend/.env:
MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE,
MYSQL_TABLE, MYSQL_ORDER_COLUMN (defaults to the table's primary key).
"""
import os
import re
from datetime import date, datetime, time as dtime, timedelta
from decimal import Decimal

import pymysql
from dotenv import load_dotenv

load_dotenv()

_IDENT = re.compile(r"^[A-Za-z0-9_]+$")


class HardwareDBError(Exception):
    """Raised for any problem reading the hardware database."""


def _ident(name: str, label: str) -> str:
    if not name or not _IDENT.match(name):
        raise HardwareDBError(f"{label} must contain only letters, digits and underscores.")
    return name


def _jsonable(value):
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (datetime, date, dtime)):
        return value.isoformat()
    if isinstance(value, timedelta):
        return str(value)
    if isinstance(value, (bytes, bytearray)):
        return value.decode("utf-8", errors="replace")
    return value


def _config() -> dict:
    return {
        "host": os.getenv("MYSQL_HOST", "127.0.0.1"),
        "port": int(os.getenv("MYSQL_PORT", "3306")),
        "user": os.getenv("MYSQL_USER", "root"),
        "password": os.getenv("MYSQL_PASSWORD", ""),
        "database": _ident(os.getenv("MYSQL_DATABASE") or "esp32_environment", "MYSQL_DATABASE"),
        "table": _ident(os.getenv("MYSQL_TABLE") or "sensor_data", "MYSQL_TABLE"),
        "order_column": os.getenv("MYSQL_ORDER_COLUMN") or None,
    }


def _connect(cfg: dict):
    try:
        return pymysql.connect(
            host=cfg["host"],
            port=cfg["port"],
            user=cfg["user"],
            password=cfg["password"],
            database=cfg["database"],
            connect_timeout=5,
            read_timeout=10,
            cursorclass=pymysql.cursors.DictCursor,
        )
    except pymysql.MySQLError as exc:
        raise HardwareDBError(
            f"Cannot connect to MySQL at {cfg['host']}:{cfg['port']} "
            f"(database '{cfg['database']}'). Is XAMPP MySQL running? ({exc})"
        ) from exc


def _order_column(conn, cfg: dict) -> str:
    if cfg["order_column"]:
        return _ident(cfg["order_column"], "MYSQL_ORDER_COLUMN")
    with conn.cursor() as cur:
        cur.execute(
            "SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE "
            "WHERE TABLE_SCHEMA=%s AND TABLE_NAME=%s AND CONSTRAINT_NAME='PRIMARY' "
            "ORDER BY ORDINAL_POSITION LIMIT 1",
            (cfg["database"], cfg["table"]),
        )
        row = cur.fetchone()
    if not row:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT 1 FROM information_schema.TABLES "
                "WHERE TABLE_SCHEMA=%s AND TABLE_NAME=%s",
                (cfg["database"], cfg["table"]),
            )
            exists = cur.fetchone()
        if not exists:
            raise HardwareDBError(
                f"Table '{cfg['table']}' does not exist in database '{cfg['database']}'. "
                "Check MYSQL_TABLE in backend/.env."
            )
        raise HardwareDBError(
            f"Table '{cfg['table']}' has no primary key. "
            "Set MYSQL_ORDER_COLUMN to its timestamp/id column."
        )
    return row["COLUMN_NAME"]


def get_latest_reading() -> dict:
    cfg = _config()
    conn = _connect(cfg)
    try:
        order_col = _order_column(conn, cfg)
        with conn.cursor() as cur:
            try:
                cur.execute(
                    f"SELECT * FROM `{cfg['table']}` ORDER BY `{order_col}` DESC LIMIT 1"
                )
            except pymysql.MySQLError as exc:
                raise HardwareDBError(f"Query failed: {exc}") from exc
            row = cur.fetchone()
    finally:
        conn.close()

    if row is None:
        raise HardwareDBError(f"Table '{cfg['table']}' has no rows yet.")

    return {
        "source": "xampp_mysql",
        "measured_by_device": True,
        "database": cfg["database"],
        "table": cfg["table"],
        "ordered_by": order_col,
        "columns": list(row.keys()),
        "reading": {k: _jsonable(v) for k, v in row.items()},
    }