import React from 'react';
import { clsx as cn } from 'clsx';
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionContent,
} from './Accordion';

interface Tip {
  type: 'good' | 'improve';
  tip: string;
  explanation: string;
}

interface Category {
  score: number;
  tips: Tip[];
}

interface Feedback {
  toneAndStyle: Category;
  content: Category;
  structure: Category;
  skills: Category;
}

// Helper Component: ScoreBadge
interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  const isGood = score > 69;
  const isOk = score > 39;

  const bgClass = isGood ? 'bg-green-100' : isOk ? 'bg-yellow-100' : 'bg-red-100';
  const textClass = isGood ? 'text-green-600' : isOk ? 'text-yellow-600' : 'text-red-600';
  const icon = isGood ? '✓' : isOk ? '!' : '✕';

  return (
    <div className={cn(bgClass, 'px-3 py-1 rounded-md inline-flex items-center gap-2')}>
      <span className={cn('font-bold', textClass)}>{icon}</span>
      <span className={cn(textClass, 'font-semibold text-sm')}>
        {score}/100
      </span>
    </div>
  );
};

// Helper Component: CategoryHeader
interface CategoryHeaderProps {
  title: string;
  categoryScore: number;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ title, categoryScore }) => {
  return (
    <div className='flex flex-row items-center justify-between w-full px-2'>
      <h3 className='text-lg font-semibold text-gray-800'>{title}</h3>
      <ScoreBadge score={categoryScore} />
    </div>
  );
};

// Helper Component: CategoryContent
interface CategoryContentProps {
  tips: Tip[];
}

const CategoryContent: React.FC<CategoryContentProps> = ({ tips }) => {
  return (
    <div className='space-y-4 px-2'>
      {/* Tips Grid */}
      <div className='grid grid-cols-2 gap-4'>
        {tips.map((tip, index) => (
          <div
            key={index}
            className={cn(
              'flex flex-row items-start gap-3 p-3 rounded-lg',
              tip.type === 'good'
                ? 'bg-green-50 border border-green-200'
                : 'bg-yellow-50 border border-yellow-200'
            )}
          >
            <span
              className={cn(
                'text-lg font-bold mt-0.5',
                tip.type === 'good' ? 'text-green-600' : 'text-yellow-600'
              )}
            >
              {tip.type === 'good' ? '✓' : '!'}
            </span>
            <p className='text-gray-800 text-sm font-medium'>{tip.tip}</p>
          </div>
        ))}
      </div>

      {/* Explanations List */}
      <div className='space-y-2 mt-4 border-t border-gray-200 pt-4'>
        {tips.map((tip, index) => (
          <div
            key={index}
            className={cn(
              'p-3 rounded-md text-sm',
              tip.type === 'good'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            )}
          >
            <p className='font-medium mb-1'>{tip.tip}</p>
            <p className='opacity-90'>{tip.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Details Component
interface DetailsProps {
  feedback: Feedback;
}

const Details: React.FC<DetailsProps> = ({ feedback }) => {
  const categories = [
    { title: 'Tone & Style', data: feedback.toneAndStyle },
    { title: 'Content', data: feedback.content },
    { title: 'Structure', data: feedback.structure },
    { title: 'Skills', data: feedback.skills },
  ];

  return (
    <div className='bg-white rounded-2xl shadow-md p-6 w-full'>
      <h2 className='text-2xl font-bold text-gray-800 mb-6'>Detailed Feedback</h2>
      
      <Accordion>
  {categories.map((category, index) => {
    const itemId = `category-${index}`;

    return (
      <AccordionItem key={index} id={itemId}>
        <AccordionHeader itemId={itemId}>
          <CategoryHeader
            title={category.title}
            categoryScore={category.data.score}
          />
        </AccordionHeader>
        <AccordionContent itemId={itemId}>
          <CategoryContent tips={category.data.tips} />
        </AccordionContent>
      </AccordionItem>
    );
  })}
</Accordion>
    </div>
  );
};

export default Details;
