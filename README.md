# Pocket Money Planner

**Live demo:** <https://pocket-money-planner.onrender.com/>

> The demo runs on Render's free tier, so the first load after a period of inactivity can take up to a minute while the server wakes up.

A small Flask web app for students. You enter your monthly pocket money and how much you want to save in a year. The app works out how much to set aside and how much you can spend, each month and each week.

## Features

- **Accounts**: sign up and log in. Passwords are stored as salted hashes (Werkzeug).
- **Plan setup**: enter your monthly pocket money and yearly goal. A preview updates as you type, and the app rejects a goal larger than a year of pocket money.
- **Dashboard**:
  - your yearly goal and what percentage of your pocket money it is
  - a ring chart showing how each month's money splits between saving and spending
  - amounts to save and spend, per month and per week
  - a 12-month savings chart with hover tooltips and a table view
- **Design**:
  - light and dark themes, with a toggle that remembers your choice
  - page transitions (cross-document View Transitions, with a fade fallback for other browsers)
  - animations when content scrolls into view and numbers that count up
  - mobile layout
  - animations turn off when the system's "reduce motion" setting is on

## How the plan is calculated

| Value | Formula |
| --- | --- |
| Save per month | `yearly goal / 12` |
| Save per week | `yearly goal / 52` |
| Spend per month | `(monthly pocket money × 12 − yearly goal) / 12` |
| Spend per week | `(monthly pocket money × 12 − yearly goal) / 52` |

## Tech stack

- **Backend**: Python 3.12, Flask, Flask-WTF / WTForms (forms and CSRF protection), python-dotenv
- **Frontend**: Jinja2 templates, plain CSS and JavaScript (no build step or framework)
- **Storage**: JSON files on disk, one folder per user under `data/`
- **Packaging**: [uv](https://docs.astral.sh/uv/)

## Getting started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd "Pocket Money Planner"
uv sync
```

If you don't use uv:

```bash
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux
pip install flask flask-wtf python-dotenv werkzeug wtforms gunicorn
```

### 2. Configure

Copy the example environment file and set a secret key:

```bash
cp .env.example .env
```

```env
SECRET_KEY = "a-long-random-string"
```

You can generate a key with `python -c "import secrets; print(secrets.token_hex(32))"`.

### 3. Run

```bash
uv run app.py
```

Then open <http://127.0.0.1:5000>.

For production, use gunicorn instead of the debug server (gunicorn runs on Linux and macOS only):

```bash
uv run gunicorn app:app
```

## Project structure

```text
Pocket Money Planner/
├── app.py                 # Flask routes: index, login, sign_up, details, logout
├── forms.py               # WTForms: LoginForm, SignUpForm, MainForm
├── templates/
│   ├── base.html          # Layout, nav, theme toggle, flash toasts
│   ├── _macros.html       # Form field macro with a floating label
│   ├── index.html         # Landing page (logged out) and dashboard (logged in)
│   ├── login.html
│   ├── sign_up.html
│   └── details.html       # Plan form with live preview
├── static/
│   ├── CSS/style.css      # Design tokens, themes, layout, animations
│   └── JS/app.js          # Reveal, count-up, charts, theme, transitions
├── data/                  # Created at runtime (git-ignored)
│   └── <username>/
│       ├── credentials.json
│       └── details.json
├── pyproject.toml
└── .env.example
```

## Routes

| Route | Methods | Description |
| --- | --- | --- |
| `/` | GET | Landing page, or the dashboard if you're logged in |
| `/sign_up` | GET, POST | Create an account |
| `/login` | GET, POST | Log in |
| `/details/<username>` | GET, POST | Set or edit your plan (only for the logged-in user) |
| `/logout` | GET | Log out |

## Notes

- User data is stored as plain JSON files, which is fine for learning or personal use. For more users, switch to a database such as SQLite.
- `data/` and `.env` are git-ignored. Never commit real secrets or user data.
