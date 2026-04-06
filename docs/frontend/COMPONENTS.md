# COMPONENTS

## C est quoi un composant
- Un composant React est un bloc reutilisable.
- Il peut afficher une partie de l interface ou gerer une petite logique.

## Exemples concrets du projet
- `AppLayout` gere la mise en page globale (sidebar, topbar, contenu).
- `PublicNavbar` affiche la barre de navigation de la page d accueil.
- `NotificationDropdown` affiche une liste de notifications.
- `Button`, `Input`, `Select`, `Dialog` sont des composants UI reutilisables.

## Composants reutilisables
- Les composants UI dans `src/components/ui/` sont utilises partout.
- Ils garantissent un style coherent.
- Ils reduisent la duplication du code.

## Props et state
- Les props permettent de passer des donnees a un composant.
- Le state gere l etat interne (ex: ouverture d une modal).

Exemple simple:
```tsx
<Button variant="outline" onClick={handleSave}>
  Save
</Button>
```

Exemple avec state local:
```tsx
const [open, setOpen] = useState(false);

return (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger>Open</DialogTrigger>
  </Dialog>
);
```

## Notes sur les composants vides
- `UserForm.tsx` et `UserTable.tsx` existent mais sont vides.
- Ils semblent prevus pour une evolution future.
