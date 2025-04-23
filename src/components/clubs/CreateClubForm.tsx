
// Fix for CreateClubForm.tsx to use createNewClub properly
// Replace the onSubmit function with this fixed version

const onSubmit = async (values: FormValues) => {
  if (!user) {
    toast.error('You must be logged in to create a club');
    return;
  }

  try {
    setIsSubmitting(true);
    toast.loading('Creating club...');
    
    // Upload images if selected
    let logoUrl = null;
    let bannerUrl = null;
    
    if (logoImage) {
      setUploadingLogo(true);
      logoUrl = await uploadImage(logoImage, 'club_logo');
      setUploadingLogo(false);
    }
    
    if (bannerImage) {
      setUploadingBanner(true);
      bannerUrl = await uploadImage(bannerImage, 'club_banner');
      setUploadingBanner(false);
    }
    
    const newClub = await createNewClub({
      name: values.name,
      description: values.description || '',
      club_type: values.clubType as any,
      membership_type: values.membershipType as any,
      premium_price: values.membershipType === 'premium' && values.premiumPrice 
        ? parseFloat(values.premiumPrice) 
        : undefined,
      logo_url: logoUrl,
      banner_url: bannerUrl,
    });
    
    toast.dismiss();
    toast.success('Club created successfully!');
    navigate(`/clubs/${newClub.id}`);
  } catch (error) {
    console.error('Error creating club:', error);
    toast.dismiss();
    toast.error('Failed to create club. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
