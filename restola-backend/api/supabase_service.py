"""
Service layer for Supabase database operations.
Uses Supabase SDK instead of direct PostgreSQL connection.
"""
from typing import List, Dict, Any, Optional
from .supabase_client import get_supabase_client


def get_menu_items(category_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get all menu items, optionally filtered by category."""
    supabase = get_supabase_client()
    query = supabase.table('menu_items').select('*, menu_categories(*)')
    
    if category_id:
        query = query.eq('category_id', category_id)
    
    response = query.execute()
    return response.data or []


def get_menu_categories() -> List[Dict[str, Any]]:
    """Get all menu categories."""
    supabase = get_supabase_client()
    response = supabase.table('menu_categories').select('*').execute()
    return response.data or []


def get_restaurant_details() -> Optional[Dict[str, Any]]:
    """Get restaurant details (first record)."""
    supabase = get_supabase_client()
    response = supabase.table('restaurant_details').select('*').limit(1).execute()
    data = response.data or []
    return data[0] if data else None


def get_orders() -> List[Dict[str, Any]]:
    """Get all orders with their items."""
    supabase = get_supabase_client()
    response = supabase.table('orders').select('*, order_items(*)').execute()
    return response.data or []


def get_order(order_id: str) -> Optional[Dict[str, Any]]:
    """Get a single order with items."""
    supabase = get_supabase_client()
    response = supabase.table('orders').select('*, order_items(*)').eq('id', order_id).execute()
    data = response.data or []
    return data[0] if data else None


def create_order(order_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new order with items."""
    supabase = get_supabase_client()
    
    # Extract items from order data
    items = order_data.pop('items', [])
    
    # Create order
    response = supabase.table('orders').insert(order_data).execute()
    order = response.data[0] if response.data else None
    
    if order and items:
        # Add order_id to each item
        for item in items:
            item['order_id'] = order['id']
        
        # Create order items
        supabase.table('order_items').insert(items).execute()
    
    return order


def update_order(order_id: str, order_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Update an existing order."""
    supabase = get_supabase_client()
    response = supabase.table('orders').update(order_data).eq('id', order_id).execute()
    data = response.data or []
    return data[0] if data else None


def delete_order(order_id: str) -> bool:
    """Delete an order and its items."""
    supabase = get_supabase_client()
    # Order items will be deleted via CASCADE
    supabase.table('orders').delete().eq('id', order_id).execute()
    return True


def get_profiles() -> List[Dict[str, Any]]:
    """Get all profiles."""
    supabase = get_supabase_client()
    response = supabase.table('profiles').select('*').execute()
    return response.data or []


def get_profile(profile_id: str) -> Optional[Dict[str, Any]]:
    """Get a single profile."""
    supabase = get_supabase_client()
    response = supabase.table('profiles').select('*').eq('id', profile_id).execute()
    data = response.data or []
    return data[0] if data else None


def create_profile(profile_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new profile."""
    supabase = get_supabase_client()
    response = supabase.table('profiles').insert(profile_data).execute()
    return response.data[0] if response.data else {}


def update_profile(profile_id: str, profile_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Update an existing profile."""
    supabase = get_supabase_client()
    response = supabase.table('profiles').update(profile_data).eq('id', profile_id).execute()
    data = response.data or []
    return data[0] if data else None


def delete_profile(profile_id: str) -> bool:
    """Delete a profile."""
    supabase = get_supabase_client()
    supabase.table('profiles').delete().eq('id', profile_id).execute()
    return True
