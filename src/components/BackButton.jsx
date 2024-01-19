import Button from "./Button";
import { useNavigate } from "react-router-dom";

function BackButton({ href = -1 }) {
  const navigate = useNavigate();
  return (
    <Button
      type={"back"}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
    >
      &larr; Back
    </Button>
  );
}

export default BackButton;
