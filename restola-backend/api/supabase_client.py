from decouple import config
from supabase import create_client, Client


def get_supabase_client() -> Client:
    """
    Returns a connected Supabase client instance.
    Make sure SUPABASE_URL and SUPABASE_KEY are set in your .env file.
    """
    supabase_url: str = config('SUPABASE_URL', default='')
    supabase_key: str = config('SUPABASE_KEY', default='')

    if not supabase_url or not supabase_key:
        raise ValueError("Supabase URL and Key must be provided in the .env file.")

    supabase: Client = create_client(supabase_url, supabase_key)
    return supabase
