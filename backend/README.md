# Backend for Explainable LMS

## Installation

Follow these steps to set up and run the backend for the Explainable LMS project.

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- A virtual environment tool (optional but recommended)
- Git (to clone the repository)

### Steps

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd explainable-lms/backend
   ```

2. **Set Up a Virtual Environment (Optional)**
   It is recommended to use a virtual environment to avoid dependency conflicts.

   ```bash
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate
   ```

3. **Install Dependencies**
   Install the required Python packages using pip:

   ```bash
   pip install -r requirements.txt
   ```

4. **Set Up Environment Variables**
   Create a `.env` file in the `backend` directory and add the necessary environment variables. For example:

   ```env
   DATABASE_URL=postgresql://user:password@localhost/dbname
   SECRET_KEY=your_secret_key
   DEBUG=True
   ```

5. **Run Database Migrations**
   If the project uses a database, apply the migrations:

   ```bash
   python app/database.py
   ```

6. **Start the Backend Server**
   Run the backend server:

   ```bash
   python app/main.py
   ```

   The server should now be running at `http://127.0.0.1:8000`.

## Project Structure

- `app/`
  - Contains the main application code.
- `routes/`
  - Contains route handlers for different API endpoints.
- `services/`
  - Contains service logic for the application.
- `schemas/`
  - Contains data validation schemas.
- `ml/`
  - Contains machine learning-related code.

## Troubleshooting

- If you encounter issues with dependencies, ensure you are using the correct Python version and virtual environment.
- Check the `.env` file for correct environment variable values.
- Refer to the logs for debugging information.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
