import { Link } from 'react-router-dom';

interface CategoryCardProps {
  id: string;
  name: string;
  color: string;
  image?: string;
}

const CategoryCard = ({ id, name, color, image }: CategoryCardProps) => {
  return (
    <Link
      to={`/search/${id}`}
      className="relative overflow-hidden rounded-lg aspect-square animate-fade-in group"
      style={{ backgroundColor: color }}
    >
      <div className="p-4 h-full flex flex-col justify-between">
        <h3 className="font-bold text-xl text-foreground">{name}</h3>
        
        {image && (
          <img
            src={image}
            alt={name}
            className="absolute -bottom-4 -right-4 w-24 h-24 object-cover rounded shadow-lg transform rotate-25 group-hover:rotate-12 transition-transform duration-300"
          />
        )}
      </div>
    </Link>
  );
};

export default CategoryCard;
