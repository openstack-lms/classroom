import { 
    HiDocument, 
    HiPhotograph,
    HiDocumentText,
    HiDocumentDuplicate,
    HiTable,
    HiPresentationChartBar,
    HiCode,
    HiVideoCamera,
    HiMusicNote,
    HiDatabase
} from "react-icons/hi";

export interface FileIconInfo {
    icon: JSX.Element;
    backgroundColor: string;
    baseColor: string;
}

export function getFileIconInfo(type: string): FileIconInfo {
    // Image types
    if (type.startsWith('image/')) {
        return {
            icon: <HiPhotograph />,
            backgroundColor: 'bg-emerald-100',
            baseColor: 'text-emerald-500'
        };
    }

    // Document types
    if (type === 'application/pdf') {
        return {
            icon: <HiDocumentText />,
            backgroundColor: 'bg-red-100',
            baseColor: 'text-red-500'
        };
    }
    if (type.includes('word') || type === 'text/plain') {
        return {
            icon: <HiDocumentDuplicate />,
            backgroundColor: 'bg-blue-100',
            baseColor: 'text-blue-500'
        };
    }
    if (type.includes('spreadsheet') || type.includes('excel') || type === 'text/csv') {
        return {
            icon: <HiTable />,
            backgroundColor: 'bg-green-100',
            baseColor: 'text-green-500'
        };
    }
    if (type.includes('presentation') || type.includes('powerpoint')) {
        return {
            icon: <HiPresentationChartBar />,
            backgroundColor: 'bg-orange-100',
            baseColor: 'text-orange-500'
        };
    }

    // Code and data files
    if (type === 'text/javascript' || type === 'text/css' || type === 'text/html') {
        return {
            icon: <HiCode />,
            backgroundColor: 'bg-purple-100',
            baseColor: 'text-purple-500'
        };
    }
    if (type === 'application/json') {
        return {
            icon: <HiDatabase />,
            backgroundColor: 'bg-yellow-100',
            baseColor: 'text-yellow-500'
        };
    }

    // Media types
    if (type.startsWith('video/')) {
        return {
            icon: <HiVideoCamera />,
            backgroundColor: 'bg-red-100',
            baseColor: 'text-red-500'
        };
    }
    if (type.startsWith('audio/')) {
        return {
            icon: <HiMusicNote />,
            backgroundColor: 'bg-blue-100',
            baseColor: 'text-blue-500'
        };
    }

    // Default
    return {
        icon: <HiDocument />,
        backgroundColor: 'bg-gray-100',
        baseColor: 'text-gray-500'
    };
} 