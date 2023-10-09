export const joinFullName = (firstName: string, lastName?: string): string => {
    if (!lastName) {
        return firstName;
    }
    return `${firstName} ${lastName}`;
};
