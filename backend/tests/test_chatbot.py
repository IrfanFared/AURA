import pytest
from unittest.mock import MagicMock, patch
from app.services.chatbot import ChatbotService

@pytest.fixture
def chatbot_service():
    # Reset initialization flag for each test
    ChatbotService._initialized = False
    return ChatbotService()

@patch("app.services.chatbot.vertexai.init")
@patch("app.services.chatbot.GenerativeModel")
def test_generate_response_success(mock_model_class, mock_vertex_init, chatbot_service):
    # Setup mock response
    mock_model = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "Hello from AI"
    mock_model.generate_content.return_value = mock_response
    mock_model_class.return_value = mock_model
    
    context = {"score": 85, "vault_balance": 1000000, "total_income": 5000000, "total_expense": 4000000, "net_cashflow": 1000000}
    response = chatbot_service.generate_response("Halo", context)
    
    assert response == "Hello from AI"
    mock_vertex_init.assert_called_once()
    mock_model_class.assert_called_with("gemini-1.5-flash-001")

@patch("app.services.chatbot.vertexai.init")
@patch("app.services.chatbot.GenerativeModel")
def test_generate_response_initialization_error(mock_model_class, mock_vertex_init, chatbot_service):
    mock_vertex_init.side_effect = Exception("Auth failed")
    
    response = chatbot_service.generate_response("Halo", {})
    
    assert "kendala inisialisasi" in response
    assert "Auth failed" in response

@patch("app.services.chatbot.vertexai.init")
@patch("app.services.chatbot.GenerativeModel")
def test_generate_response_generation_error(mock_model_class, mock_vertex_init, chatbot_service):
    mock_model = MagicMock()
    mock_model.generate_content.side_effect = Exception("Quota exceeded")
    mock_model_class.return_value = mock_model
    
    response = chatbot_service.generate_response("Halo", {})
    
    assert "kuota layanan AI" in response
    assert "penuh" in response
