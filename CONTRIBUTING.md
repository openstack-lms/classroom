# Contributing Guide

Thank you for considering contributing to this project! We welcome bug reports, feature requests, and code contributions. Please follow the guidelines below to help us maintain a consistent and high-quality codebase.

---

## 🧠 Commit Message Convention

Please use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to structure your commit messages:

### Format

```
type(scope?): subject
```

### Examples

```
feat: add user login page
fix(api): handle 500 error for null values
docs: update README with new instructions
refactor(auth): simplify token validation
```

### Common Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, missing semi colons, etc)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, tooling changes, etc.

---

## 🌿 Branch Naming Convention

Create a new branch for each piece of work. Use the format:

```
type/short-description
```

### Examples

```
feat/user-authentication
fix/login-timeout
docs/api-reference
```

Please keep branch names lowercase and use hyphens (`-`) for word separation.

---

## 🛠️ Making a Pull Request

1. Fork the repository
2. Create your branch: `git checkout -b feat/your-feature`
3. Commit your changes using the conventions above
4. Push to your fork and open a pull request
5. Provide context and screenshots if applicable

All pull requests will be reviewed. Please be responsive to feedback.
