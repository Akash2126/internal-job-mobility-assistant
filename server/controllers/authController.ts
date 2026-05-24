import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User, Profile, setupDatabase } from "../db";
import { generateToken } from "../middleware/auth";

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email and password are required fields." });
      return;
    }

    // Force database to sync if not fully initialized
    await setupDatabase();

    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid corporate credentials." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid corporate credentials." });
      return;
    }

    // Load their profile to send initial data
    const profile = await Profile.findOne({ where: { userId: user.id } });

    const token = generateToken(user.id, user.email, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      profile,
    });
  } catch (err: any) {
    console.error("Auth Exception during login: ", err);
    res.status(500).json({ success: false, message: "Internal Auth Gateway failure." });
  }
}

export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, role, name, department, title, domain } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ success: false, message: "Missing required registration parameters." });
      return;
    }

    // Check existing
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      res.status(400).json({ success: false, message: "This email registration already occupies the corporate registry." });
      return;
    }

    const userRole = role === "HR_ADMIN" ? "HR_ADMIN" : "EMPLOYEE";

    const newUser = await User.create({
      email,
      password,
      role: userRole,
    });

    const userDomain = domain || "aiml";

    // Setup default details for Profile
    const newProfile = await Profile.create({
      userId: newUser.id,
      name,
      title: title || (userRole === "HR_ADMIN" ? "Talent Architect" : "Software Associate"),
      department: department || (userRole === "HR_ADMIN" ? "Talent Operations" : "Engineering"),
      level: "L5",
      hireDate: "May 2026",
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      bio: "Newly onboarded talent ready for skill optimization.",
      domain: userDomain,
      workStyle: "Hybrid",
      relocation: false,
      priorityAreas: JSON.stringify(["Workforce Integration"]),
    });

    const token = generateToken(newUser.id, newUser.email, newUser.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      profile: newProfile,
    });
  } catch (err: any) {
    console.error("Auth Exception during signup: ", err);
    res.status(500).json({ success: false, message: "Internal Auth Registration failure." });
  }
}

export async function getCurrentUser(req: any, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized. Session expired." });
      return;
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found in parameters." });
      return;
    }

    const profile = await Profile.findOne({ where: { userId: user.id } });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      profile,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Session retrieval error." });
  }
}

export async function firebaseGoogleAuth(req: Request, res: Response): Promise<void> {
  try {
    const { email, name, uid, avatar, role, department, title, domain } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: "Missing email parameter from Google authentication." });
      return;
    }

    await setupDatabase();

    // Check existing
    let user = await User.findOne({ where: { email } });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      // High-priority developer/operator elevates dynamically
      const userRole = (role === "HR_ADMIN" || email === "hr@acme.corp" || email === "kumarakash02401@gmail.com") ? "HR_ADMIN" : "EMPLOYEE";
      
      user = await User.create({
        id: uid || undefined,
        email,
        password: "firebase_secret_oauth_token",
        role: userRole,
      });
    }

    // Check profile
    let profile = await Profile.findOne({ where: { userId: user.id } });
    if (!profile) {
      const userRole = user.role;
      const userDomain = domain || "aiml";

      profile = await Profile.create({
        userId: user.id,
        name: name || email.split("@")[0],
        title: title || (userRole === "HR_ADMIN" ? "Talent Architect" : "Software Associate"),
        department: department || (userRole === "HR_ADMIN" ? "Talent Operations" : "Engineering"),
        level: "L5",
        hireDate: "May 2026",
        avatar: avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
        bio: "Newly onboarded talent verified via corporate Google single sign-on.",
        domain: userDomain,
        workStyle: "Hybrid",
        relocation: false,
        priorityAreas: JSON.stringify(["Workforce Integration"]),
      });
    }

    const token = generateToken(user.id, user.email, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      profile,
      isNewUser,
    });
  } catch (err: any) {
    console.error("Auth Exception during Google Login integration:", err);
    res.status(500).json({ success: false, message: "Internal Auth Gateway failure." });
  }
}

