import sys, os
SRC_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'ML', 'src')
sys.path.append(SRC_PATH)

from predict import predict_aqi
from forecast_predict import forecast_next_aqi, model as forecast_model  # expose the model object