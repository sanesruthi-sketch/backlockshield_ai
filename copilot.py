from fastapi import APIRouter
from backend.app.schemas.models import CopilotRequest, CopilotResponse
from backend.app.ml.copilot_service import CopilotService

router = APIRouter()

@router.post("/copilot", response_model=CopilotResponse)
async def query_academic_copilot(req: CopilotRequest):
    """
    CampusIQ AI Academic Advisor Chatbot endpoint.
    Processes student query against academic record context.
    """
    result = await CopilotService.process_student_query(
        user_message=req.message,
        student_context=req.context
    )
    return result
