# Explainable LMS Frontend

This is the frontend for the Explainable Learning Management System (LMS). It is built using React and Tailwind CSS, and is powered by Vite for development and build processes.

## Features

- User authentication (Login/Signup)
- Role-based dashboards for students and teachers
- Course management
- Enrollment details
- SHAP waterfall plot visualization for explainability

## Folder Structure

```
public/          # Static assets
src/             # Source code
  assets/        # Images and other assets
  components/    # React components
  context/       # Context API for state management
  services/      # API service functions
```

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the frontend directory:
   ```bash
   cd explainable-lms/frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

- Start the development server:
  ```bash
  npm run dev
  ```
- Build for production:
  ```bash
  npm run build
  ```
- Preview the production build:
  ```bash
  npm run preview
  ```

## Requirements

See the `requirements.txt` file for dependencies.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
