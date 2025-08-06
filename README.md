# Cartaisy

Cartaisy – A customizable, Shopify-powered mobile app solution that transforms online stores into fully branded mobile experiences. We handle everything from setup to store management (A–Z), letting merchants focus on sales while we deliver a seamless, high-performing shopping app tailored to their brand.

## Features

- **E-commerce Mobile App**: Built with React Native and Expo
- **Modern UI/UX**: Customizable design system with Tamagui
- **Authentication**: Complete user authentication flow
- **Shopping Experience**: Cart, wishlist, and product browsing
- **Multi-platform**: iOS and Android support

## Tech Stack

- **Frontend**: React Native, Expo Router
- **UI Framework**: Tamagui
- **Navigation**: Expo Router with file-based routing
- **Forms**: React Hook Form
- **Styling**: Custom design system with Figtree fonts

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on your preferred platform:
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## Project Structure

```
Cartaisy/
├── app/                    # Main app screens and navigation
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   └── ...
├── components/             # Reusable UI components
│   ├── atoms/             # Basic UI components
│   ├── molecules/         # Composite components
│   └── organisms/         # Complex components
├── assets/                # Images, fonts, and static files
├── constants/             # App constants and styles
└── tamagui/               # Tamagui configuration
```

## Development

This project uses:
- **Expo Router** for navigation
- **Tamagui** for UI components and theming
- **TypeScript** for type safety
- **ESLint** for code quality

## License

Private - All rights reserved
