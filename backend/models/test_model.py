from pydantic import BaseModel, EmailStr, Field, ValidationError
from rich.console import Console
from rich.table import Table

console = Console()


class User(BaseModel):
    name: str
    age: int = Field(ge=0, le=120)
    email: EmailStr


def run_valid_case():
    # "42" is a string, but pydantic coerces it to an int
    user = User(name="Ana", age="42", email="ana@example.com")
    console.print("[bold green]Valid user:[/bold green]", user)
    console.print("age type:", type(user.age).__name__)


def run_invalid_case():
    try:
        User(name="Bob", age=-5, email="not-an-email")
    except ValidationError as e:
        table = Table(title="Validation errors")
        table.add_column("Field", style="cyan")
        table.add_column("Problem", style="red")
        for err in e.errors():
            table.add_row(str(err["loc"][0]), err["msg"])
        console.print(table)


if __name__ == "__main__":
    run_valid_case()
    run_invalid_case()