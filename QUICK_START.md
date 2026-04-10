# Quick Start Guide - Angular 21 Pokédex

## 🚀 Running the Application

### Option 1: Standard Start
```bash
npm install
npm start
```
Navigate to: http://localhost:4200/

### Option 2: Clean Start (if you have issues)
```bash
# Remove node_modules and cache
rm -rf node_modules dist .angular
npm install
npm start
```

## 🎮 Using the Application

### 1. Home Page
- Welcome page with Pokédex branding
- Quick links to catalog and search

### 2. Browse Catalog (Shop Icon)
- View all 1000+ Pokémon in a grid
- Click any Pokémon to see details
- Automatically loads first 10,000 Pokémon

### 3. Search by ID (Book Icon)
- Enter a Pokémon ID (1-1025)
- View name, types, and sprites
- Shows front and back sprites

### 4. Team Management (Group Icon)
- View your current team (max 6 Pokémon)
- Delete individual Pokémon
- Delete entire team
- Generate random team (6 random Gen 1 Pokémon)

### 5. Pokémon Detail View
- Navigate with arrow buttons (left/right)
- Toggle front/back sprites
- Add to team (Pokéball button)
- View types and moves

## 🔧 Common Commands

### Development
```bash
# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Troubleshooting

#### Port 4200 Already in Use
```bash
# Kill process on port 4200 (Windows)
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# Or use a different port
npx ng serve --port 4300
```

#### Build Errors
```bash
# Clear cache and rebuild
rm -rf .angular dist
npm run build
```

#### Dependencies Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 📱 Routes

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/catalog` | Browse all Pokémon |
| `/details` | Search by ID |
| `/photo/:id` | View Pokémon details |
| `/team` | Manage your team |

## 💡 Tips

1. **Adding to Team**: 
   - Navigate to a Pokémon in detail view
   - Click the Pokéball button
   - Maximum 6 Pokémon per team

2. **Navigation**:
   - Use left/right arrows in detail view
   - Wraps around (1 ↔ 1025)

3. **Performance**:
   - API responses are cached for 5 minutes
   - Images load lazily for better performance

4. **Data Persistence**:
   - Teams are saved to localStorage
   - Data persists across browser sessions

## 🐛 Troubleshooting

### "Cannot find module" Error
```bash
npm install
```

### Blank Page
- Check browser console for errors
- Verify all dependencies installed: `npm ls`
- Clear browser cache

### Pokémon Not Loading
- Check internet connection (needs PokeAPI)
- Verify API is up: https://pokeapi.co/api/v2/pokemon/1
- Check browser console for CORS errors

## 🎨 Customization

### Change Theme
Edit `src/styles.scss`:
```scss
$primary: mat.m2-define-palette(mat.$m2-purple-palette);
$accent: mat.m2-define-palette(mat.$m2-green-palette);
```

### Add New Routes
Edit `src/app/app.routes.ts`:
```typescript
{
  path: 'my-new-route',
  loadComponent: () => import('./my-component/my-component.component')
    .then(m => m.MyComponent)
}
```

## 📚 Next Steps

1. Review the [MIGRATION_CHANGES.md](./MIGRATION_CHANGES.md) for what changed
2. Read the [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) for future improvements
3. Check out [Angular Docs](https://angular.dev) for learning more

## 🆘 Getting Help

- Check the [README](./README.md)
- Review [MIGRATION_CHANGES.md](./MIGRATION_CHANGES.md)
- Open an issue on GitHub

---

**Happy Coding! 🎉**
