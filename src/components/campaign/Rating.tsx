import { FaRegStar, FaStar } from "react-icons/fa6";

export default function Rating({ score }: { score: number }) {
  return (
    <div className="flex items-center justify-center">
      <FaStar className="text-sm" />
      <FaStar className="text-sm" />
      <FaRegStar className="text-sm" />
      <FaRegStar className="text-sm" />
      <FaRegStar className="text-sm" />
      <p className="font-semibold text-muted-foreground text-sm ml-2">
        {score}/5
      </p>
    </div>
  );
}
