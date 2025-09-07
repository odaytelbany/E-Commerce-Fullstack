import React, { useEffect } from 'react'
import { useProductStore } from '../store/useProductStore';
import { useParams } from 'react-router';

const CategoryPage = () => {
    const {fetchProductsByCategory, products, loading} = useProductStore();
    const {category} = useParams();

    useEffect(() => {
        fetchProductsByCategory(category);
    }, [category, fetchProductsByCategory]);

    console.log(products);
  return (
    <div>CategoryPage</div>
  )
}

export default CategoryPage;