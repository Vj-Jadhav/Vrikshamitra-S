// In your backend routes (userRoutes.js)
router.put('/user/:userId/avatar', async (req, res) => {
  try {
    const { userId } = req.params;
    const { photo } = req.body;

    // Update user avatar in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { photo },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Avatar update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});