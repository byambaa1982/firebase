"""Tests for utility functions."""

import pytest
from sample_project.utils import greet, add


class TestGreet:
    """Test cases for the greet function."""
    
    def test_greet_with_name(self):
        """Test greeting with a valid name."""
        result = greet("Alice")
        assert result == "Hello, Alice!"
    
    def test_greet_with_empty_string(self):
        """Test greeting with an empty string."""
        result = greet("")
        assert result == "Hello, stranger!"
    
    def test_greet_with_different_names(self):
        """Test greeting with various names."""
        assert greet("Bob") == "Hello, Bob!"
        assert greet("Charlie") == "Hello, Charlie!"


class TestAdd:
    """Test cases for the add function."""
    
    def test_add_positive_numbers(self):
        """Test adding two positive numbers."""
        assert add(2, 3) == 5
    
    def test_add_negative_numbers(self):
        """Test adding two negative numbers."""
        assert add(-2, -3) == -5
    
    def test_add_mixed_numbers(self):
        """Test adding positive and negative numbers."""
        assert add(5, -3) == 2
        assert add(-5, 3) == -2
    
    def test_add_with_zero(self):
        """Test adding with zero."""
        assert add(0, 5) == 5
        assert add(5, 0) == 5
        assert add(0, 0) == 0
