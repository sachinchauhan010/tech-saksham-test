export enum ROLE{
    ADMIN = "admin",
    USER = "user",
    SUPER_ADMIN = "super_admin",
    GUEST = "guest",
    ORGANIZER = "organizer",
    DELEGATE = "delegate"
}

export enum OTP_TYPE {
    EMAIL_VERIFICATION = "email_verification",
    PHONE_NUMBER_VERIFICATION = "phone_number_verification",
    PASSWORD_RESET = "password_reset"
}

export enum OTP_STATUS {
    PENDING = "pending",
    USED = "used",
    EXPIRED = "expired",
    MAX_ATTEMPTS_REACHED = "max_attempts_reached"
}

export enum EVENT_CATEGORY {
    CONFERENCE = "conference",
    WORKSHOP = "workshop",
    SEMINAR = "seminar",
    SOCIAL = "social"
}

export enum EVENT_FORMAT {
    IN_PERSON = "in-person",
    VIRTUAL = "virtual",
    HYBRID = "hybrid"
}

export enum EVENT_STATUS {
    DRAFT = "draft",
    PUBLISHED = "published",
    ONGOING = "ongoing",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}

export enum ID_CARD_TYPE {
    GUEST = "guest",
    ORGANIZER = "organizer",
    DELEGATE = "delegate"
}


