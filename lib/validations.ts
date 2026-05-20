import { NextResponse } from 'next/server';

export const validateIndianPhoneNumber = (phone: string): true | NextResponse => {
  const phoneRegex = /^[6-9]\d{9}$/;
  const isValidPhone = phoneRegex.test(phone.replace(/\D/g, ''));
  if (!isValidPhone) {
    return NextResponse.json(
      { error: 'Invalid phone number format' },
      { status: 400 }
    );
  }
  return true;
};

export const validateEmail = (email: string): true | NextResponse => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isValidEmail = emailRegex.test(email);
  if (!isValidEmail) {
    return NextResponse.json(
      { error: 'Invalid email format' },
      { status: 400 }
    );
  }
  return true;
};

export const validateName = (name: string): true | NextResponse => {
  if (name.length > 25) {
    return NextResponse.json(
      { error: 'Name is too long (max 25 characters)' },
      { status: 400 }
    );
  }
  const nameRegex = /^[a-zA-Z\s]+$/;
  const isValidName = nameRegex.test(name);
  if (!isValidName) {
    return NextResponse.json(
      { error: 'Name can only contain letters and spaces' },
      { status: 400 }
    );
  }
  return true;
};

export const validateOTP = (otp: string): true | NextResponse => {
  if (otp.length !== 6) {
    return NextResponse.json(
      { error: 'OTP must be 6 digits' },
      { status: 400 }
    );
  }
  const otpRegex = /^\d{6}$/;
  const isValidOTP = otpRegex.test(otp);
  if (!isValidOTP) {
    return NextResponse.json(
      { error: 'OTP must be 6 digits' },
      { status: 400 }
    );
  }
  return true;
};

export interface ValidationResult {
  success: boolean;
  error?: {
    message: string;
  };
}

export const validateFields = (
  data: Record<string, any>,
  requiredFields: string[]
): ValidationResult => {

  const missingField = requiredFields.find(field =>
    data[field] === undefined ||
    data[field] === null ||
    data[field] === ""
  );

  if (missingField) {
    return {
      success: false,
      error: {
        message: `${missingField.charAt(0).toUpperCase() + missingField.slice(1)} is required`
      }
    };
  }

  return { success: true };
};
