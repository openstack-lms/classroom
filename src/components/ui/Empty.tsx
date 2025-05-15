import { IconType } from "react-icons";

interface EmptyProps {
	icon: IconType;
	title: string;
	description: string;
	className?: string;
}

// export default function Empty({ icon: Icon, title, description, className = "" }: EmptyProps) {
// 	return (
// 		<div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
// 			<Icon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
// 			<h3 className="text-lg font-medium text-foreground-primary mb-1">{title}</h3>
// 			<p className="text-foreground-secondary max-w-md">{description}</p>
// 		</div>
// 	);
// } 

const Empty: React.FC<EmptyProps> = ({ icon: Icon, title, description, className = "" }) => {
	return (
		<div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
			<Icon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
			<h3 className="text-lg font-medium text-foreground-primary mb-1">{title}</h3>
			<p className="text-foreground-secondary max-w-md">{description}</p>
		</div>
	);
};

export default Empty;