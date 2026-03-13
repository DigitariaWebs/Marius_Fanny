export const getRedirectPath = (role: string) => {
  switch (role) {
    case "admin":
      return "/dashboard";
    case "kitchen_staff":
      return "/staff/production";
    case "customer_service":
      return "/staff/commandes";
    case "deliveryDriver":
      return "/staff/delivery";
    case "vendeur":
    case "four":
      return "/staff/vendeur";
    case "pro":
      return "/pro";
    case "client":
    default:
      return "/";
  }
};

