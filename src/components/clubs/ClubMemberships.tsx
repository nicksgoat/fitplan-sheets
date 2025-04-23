
// Fix the membership type casting
// Where we need to use upgradeToMembership with a string parameter:

const handleUpgrade = async (membershipType: string) => {
  try {
    await upgradeToMembership(membershipType as MembershipType);
    toast.success(`Upgraded to ${membershipType} membership`);
    refreshMembers();
  } catch (error) {
    toast.error('Failed to upgrade membership');
  }
};
