from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField, PasswordField
from wtforms.validators import DataRequired, EqualTo, Length, NumberRange, Regexp, ValidationError


class LoginForm(FlaskForm):
    username = StringField("Username", validators=[DataRequired()])
    password = PasswordField("Password", validators=[DataRequired()])

class SignUpForm(FlaskForm):
    # Usernames become folder names under data/, so keep them filesystem-safe
    username = StringField("Username", validators=[
        DataRequired(),
        Length(min=3, max=30),
        Regexp(r"^[A-Za-z0-9_-]+$", message="Use only letters, numbers, - and _"),
    ])
    password = PasswordField("Password", validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField("Confirm Password", validators=[DataRequired(), EqualTo("password", "Passwords don't match")])

class MainForm(FlaskForm):
    monthly_pocket_money = IntegerField("Monthly Pocket Money", validators=[DataRequired(), NumberRange(min=1)])
    yearly_save_goal = IntegerField("Yearly Savings Goal", validators=[DataRequired(), NumberRange(min=1)])

    def validate_yearly_save_goal(self, field):
        if self.monthly_pocket_money.data and field.data > self.monthly_pocket_money.data * 12:
            raise ValidationError("Your goal can't be more than a year of pocket money.")
