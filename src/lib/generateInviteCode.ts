export const generateInviteCode = () => {
    return (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)).slice(0, 5);
}