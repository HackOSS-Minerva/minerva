import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="mx-auto ring-0">
        <CardContent>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-center">404</h2>
          <p className="mt-2 text-lg text-gray-600 text-center">Page not found</p>
          <p className="mt-4 text-sm text-gray-500 text-center">
            The page you're looking for doesn't exist.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
