import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="mx-auto ring-0">
        <CardContent>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">404</h2>
          <p className="mt-2 text-center text-lg text-gray-600">Page not found</p>
          <p className="mt-4 text-center text-sm text-gray-500">
            The page you're looking for doesn't exist.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
