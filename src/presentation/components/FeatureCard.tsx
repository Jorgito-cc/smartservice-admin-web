import { type ReactNode } from "react";

interface Props {
  icon: ReactNode;
  title: string;
  description: string;
}
export const FeatureCard = ({ icon, title, description }: Props) => {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="text-blue-600 text-4xl mb-3">{icon}</div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
