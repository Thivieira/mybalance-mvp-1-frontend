var imaskConfig = {
  mask: "DD/MM/YYYY",
  blocks: {
    DD: {
      mask: IMask.MaskedRange,
      from: 1,
      to: 31,
      maxLength: 2,
    },
    MM: {
      mask: IMask.MaskedRange,
      from: 1,
      to: 12,
      maxLength: 2,
    },
    YYYY: {
      mask: IMask.MaskedRange,
      from: 1900, // Adjust the range to your requirements
      to: 2100,
    },
  },
  lazy: false, // Ensures the placeholder is always visible
};

window.imaskConfig = imaskConfig;
