from supabase import Client, create_client
from src.config.settings import appConfig

supabase: Client = create_client(
    appConfig["SUPABASE_API_URL"], appConfig["SUPABASE_SECRET_KEY"]
)
