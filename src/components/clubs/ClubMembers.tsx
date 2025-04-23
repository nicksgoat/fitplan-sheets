
// Fix to properly handle updateMemberRole return type
// Where we're using updateMemberRole, we need to update the expected return type:

const handlePromoteToModerator = async (memberId: string) => {
  try {
    await updateMemberRole(memberId, 'moderator');
    toast.success('User promoted to moderator');
    refreshMembers();
  } catch (error) {
    toast.error('Failed to update role');
  }
};

const handlePromoteToAdmin = async (memberId: string) => {
  try {
    await updateMemberRole(memberId, 'admin');
    toast.success('User promoted to admin');
    refreshMembers();
  } catch (error) {
    toast.error('Failed to update role');
  }
};

const handleDemote = async (memberId: string) => {
  try {
    await updateMemberRole(memberId, 'member');
    toast.success('User role updated');
    refreshMembers();
  } catch (error) {
    toast.error('Failed to update role');
  }
};
