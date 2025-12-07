export const facultyOnly = (req, res, next) => {
    if (req.user && req.userRole === "faculty") {
        next();
    } else {
        res.status(403).json({ message: "Not authorized as faculty" });
    }
};

export const studentOnly = (req, res, next) => {
    if (req.user && req.userRole === "student") {
        next();
    } else {
        res.status(403).json({ message: "Not authorized as student" });
    }
};

export const instituteOnly = (req, res, next) => {
    if (req.user && req.userRole === "institute") {
        next();
    } else {
        res.status(403).json({ message: "Not authorized as institute" });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({
                message: `User role ${req.userRole} is not authorized to access this route`,
            });
        }
        next();
    };
};
