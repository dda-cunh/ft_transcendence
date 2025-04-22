import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class PasswordComplexityValidator:
    def validate(self, password, user=None):
        errors = []
        if len(password) > 64:
            raise ValidationError(
                _("Password must be no more than 64 characters long.")
            )
        if not re.search(r'[A-Z]', password):
            errors.append(_('Must contain at least one uppercase letter.'))
        if not re.search(r'[a-z]', password):
            errors.append(_('Must contain at least one lowercase letter.'))
        if not re.search(r'\d', password):
            errors.append(_('Must contain at least one digit.'))
        if not re.search(r'[^\w\s]', password):
            errors.append(_('Must contain at least one special character.'))
        # allow ordinary spaces, but no other Unicode whitespace
        if re.search(r'[\t\n\r\f\v]', password):
            errors.append(_('Password must not contain tabs or newlines.'))
        if errors:
            raise ValidationError(errors)

    def get_help_text(self):
        return _(
            "Your password must contain at least one uppercase letter, "
            "one lowercase letter, one digit, and one special character."
        )
       