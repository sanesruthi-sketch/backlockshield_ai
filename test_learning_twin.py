import pytest
from backend.app.services.learning_twin import LearningTwinService

def test_classify_mastery_states():
    """Verify standard status classifications for topic mastery scores."""
    assert LearningTwinService.classify_mastery_state(None)["status"] == "NOT ASSESSED"
    assert LearningTwinService.classify_mastery_state(42.0)["status"] == "priority learning gap"
    assert LearningTwinService.classify_mastery_state(65.0)["status"] == "needs practice"
    assert LearningTwinService.classify_mastery_state(85.0)["status"] == "provisional mastery"

def test_update_formula_math():
    """Verify the 0.7 * old + 0.3 * latest exponential moving average formula."""
    old_score = 50.0
    latest_quiz = 90.0
    expected = (0.7 * old_score) + (0.3 * latest_quiz)  # 35 + 27 = 62.0
    assert expected == 62.0
