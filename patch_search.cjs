const fs = require('fs');
const file = '/Users/mahintosh/dev/hopterlink/src/app/components/pages/ProviderSearch.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add state variable
content = content.replace(
  'const [selectedCategory, setSelectedCategory] = useState(ALL_SERVICES_LABEL);',
  'const [selectedCategory, setSelectedCategory] = useState(ALL_SERVICES_LABEL);\n  const [isFiltersMobileOpen, setIsFiltersMobileOpen] = useState(false);'
);

// 2. Wrap categories in scrollable container
content = content.replace(
  '<div className="flex flex-wrap gap-2">',
  '<div className="flex overflow-x-auto sm:flex-wrap gap-2 pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 sm:pb-0 scrollbar-none hide-scrollbar">'
);

// 3. Add mobile filter button & conditionally hide sidebar
content = content.replace(
  '{/* Filters and Results */}\n        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">',
  `{/* Filters and Results */}\n        <div className="flex flex-col lg:hidden mb-4">\n          <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={() => setIsFiltersMobileOpen(!isFiltersMobileOpen)}>\n            <SlidersHorizontal className="h-4 w-4" />\n            {isFiltersMobileOpen ? "Hide Filters" : t("providerSearch.filters")}\n            {activeFilterCount > 0 && <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">{activeFilterCount}</Badge>}\n          </Button>\n        </div>\n        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">`
);

content = content.replace(
  '<div className="lg:col-span-1 self-start lg:sticky lg:top-4 relative z-0">',
  '<div className={`lg:col-span-1 self-start lg:sticky lg:top-4 relative z-0 ${isFiltersMobileOpen ? "block" : "hidden"} lg:block`}>'
);

// 4. Update skeleton card layout
content = content.replace(
  /<CardContent className="pt-6">\s*<div className="flex items-start gap-4">\s*<Skeleton className="h-20 w-20 rounded-full flex-shrink-0" \/>/g,
  '<CardContent className="p-4 sm:p-6">\n        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">\n          <div className="flex items-center sm:items-start gap-4 w-full sm:w-auto">\n            <Skeleton className="h-14 w-14 sm:h-20 sm:w-20 rounded-full flex-shrink-0" />\n            <div className="sm:hidden flex-1 space-y-2">\n              <Skeleton className="h-5 w-3/4" />\n              <Skeleton className="h-4 w-16" />\n            </div>\n          </div>'
);
content = content.replace(
  /<div className="flex-1 space-y-3">/g,
  '<div className="flex-1 space-y-3 w-full">'
);

fs.writeFileSync(file, content);
console.log("Patched 1");
