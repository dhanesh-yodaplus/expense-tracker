# users/tasks.py

from celery import shared_task
from django.core.mail import send_mail

@shared_task
def send_otp_email(email, otp):
    """
    Send OTP to the user's email.
    """
    subject = "Verify Your Email - Expense Tracker"
    message = f"Your OTP for email verification is: {otp}"
    from_email = "noreply@expensetracker.com"  # Or use settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]

    send_mail(subject, message, from_email, recipient_list)
