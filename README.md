# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/5ff09a9e-b011-46bf-b876-3d47ad10e4df

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/5ff09a9e-b011-46bf-b876-3d47ad10e4df) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/5ff09a9e-b011-46bf-b876-3d47ad10e4df) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

# MarginTop Configuration Implementation Guide

This document outlines how to implement the `MarginTopConfig` component across all element configuration panels to allow consistent margin configuration for all elements.

## Implementation Steps

For each element config component that doesn't use `BaseElementConfig`, follow these steps:

1. Import the MarginTopConfig component:
```typescript
import MarginTopConfig from "./common/MarginTopConfig";
```

2. Add a marginTop variable to the component's local state:
```typescript
const marginTop = element.content?.marginTop || 0;
```

3. Create a handler function to update the marginTop value:
```typescript
const handleMarginTopChange = (value: number) => {
  const updatedContent = {
    ...element.content,
    marginTop: value
  };
  
  onUpdate({
    ...element,
    content: updatedContent
  });
};
```

4. Add the MarginTopConfig component to the style tab of your component:
```typescript
<TabsContent value="style" className="space-y-4">
  {/* ... other style content ... */}
  
  {/* Margin Top Config */}
  <div className="space-y-2">
    <h3 className="text-sm font-medium text-muted-foreground">Espaçamento</h3>
    <MarginTopConfig
      value={marginTop}
      onChange={handleMarginTopChange}
    />
  </div>
  
  {/* ... other style content ... */}
</TabsContent>
```

## Alternatively: Use BaseElementConfig

For new element config components, consider using the `BaseElementConfig` component which already includes the MarginTopConfig:

```typescript
import BaseElementConfig from "./common/BaseElementConfig";

// In your component:
return (
  <BaseElementConfig
    element={element}
    onChange={onUpdate}
    showMarginConfig={true} // This will display the margin configuration
  >
    {/* Your element-specific config content */}
  </BaseElementConfig>
);
```

## Testing

After implementation, verify that:
1. The margin configuration appears in the style tab of each element
2. Changes to the margin are correctly applied to the element in the canvas
3. The margin persists when saving and reloading the page
