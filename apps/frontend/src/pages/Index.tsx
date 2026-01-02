import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">

      <div className="text-center space-y-8 max-w-lg">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Hello, World. Again.
          </h1>
          <p className="text-xl text-muted-foreground">
            TODO: Remove this page (probably).
          </p>
        </div>

        <Button
          onClick={() => navigate("/auth")}
          className="h-14 px-8 text-lg font-medium border-2 shadow-md hover:shadow-lg hover:translate-x-[-3px] hover:translate-y-[-3px] transition-all"
        >
          ¯\(ツ)/¯
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
