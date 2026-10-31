<?php

namespace App\Enums;

enum UserRole: string
{
    case Customer = 'CUSTOMER';
    case Admin = 'ADMIN';
}
