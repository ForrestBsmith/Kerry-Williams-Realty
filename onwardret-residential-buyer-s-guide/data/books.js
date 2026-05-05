export const books = {
  onwardBuyerGuide: {
    key: "onwardBuyerGuide",
    label: "Onward - Sellers Guide",
    branding: {
      brandName: "ONWARD RESIDENTIAL",
      logoText: "O",
      title: "Residential Seller Guide",
      cssVars: {
        "--brand-primary": "#0f2f3f",
        "--brand-secondary": "#a8cfd2",
        "--brand-accent": "#d47058",
        "--ink": "#182126",
        "--paper": "#f8f5ef",
        "--bg": "#dfe6ea",
        "--font-heading": '\"Alegreya\", Georgia, serif',
        "--font-body": '\"Source Sans 3\", \"Segoe UI\", sans-serif'
      }
    },
    pdfSource: "./assets/onward-sellersguide-8-pages.pdf",
    spreads: [
      {
        left: {
          layout: "pdfPage",
          pageNumber: 1
        },
        right: {
          layout: "pdfPage",
          pageNumber: 2
        }
      },
      {
        left: {
          layout: "pdfPage",
          pageNumber: 3
        },
        right: {
          layout: "pdfPage",
          pageNumber: 4
        }
      },
      {
        left: {
          layout: "pdfPage",
          pageNumber: 5
        },
        right: {
          layout: "pdfPage",
          pageNumber: 6
        }
      },
      {
        left: {
          layout: "pdfPage",
          pageNumber: 7
        },
        right: {
          layout: "pdfPage",
          pageNumber: 8
        }
      },
      {
        left: {
          layout: "pdfPage",
          pageNumber: 9
        },
        right: {
          layout: "pdfPage",
          pageNumber: 10
        }
      },
      {
        left: {
          layout: "pdfPage",
          pageNumber: 11
        },
        right: {
          layout: "pdfPage",
          pageNumber: 12
        }
      }
    ]
  }
};

export function getBookKeys() {
  return Object.keys(books);
}
