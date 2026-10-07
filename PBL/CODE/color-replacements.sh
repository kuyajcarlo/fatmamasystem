#!/bin/bash

# Replace amber colors with new brand colors
find src/app/pages src/app/components/Layout.tsx src/app/components/CartModal.tsx src/app/components/Chatbot.tsx -name "*.tsx" -type f -exec sed -i \
  -e 's/bg-amber-500/bg-[#D4A843]/g' \
  -e 's/bg-amber-600/bg-[#B8923A]/g' \
  -e 's/hover:bg-amber-500/hover:bg-[#D4A843]/g' \
  -e 's/hover:bg-amber-600/hover:bg-[#B8923A]/g' \
  -e 's/text-amber-500/text-[#D4A843]/g' \
  -e 's/text-amber-600/text-[#D4A843]/g' \
  -e 's/hover:text-amber-600/hover:text-[#D4A843]/g' \
  -e 's/hover:text-amber-500/hover:text-[#D4A843]/g' \
  -e 's/bg-amber-50/bg-emerald-50/g' \
  -e 's/hover:bg-amber-50/hover:bg-emerald-50/g' \
  -e 's/border-amber-/border-[#D4A843]/g' \
  -e 's/ring-amber-500/ring-[#D4A843]/g' \
  -e 's/focus:ring-amber-500/focus:ring-[#D4A843]/g' \
  {} +

echo "Color replacement complete!"
