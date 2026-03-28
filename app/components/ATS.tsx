import React from 'react'

interface Suggestion {
  type: 'good' | 'improve';
  tip: string;
}

interface ATSProps {
  score: number;
  suggestions: Suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  // Determine gradient, icon, and status based on score
  const getStyles = () => {
    if (score > 69) {
      return {
        gradient: 'from-green-100',
        icon: '/icons/ats-good.svg',
        status: 'Excellent',
      };
    } else if (score > 49) {
      return {
        gradient: 'from-yellow-100',
        icon: '/icons/ats-warning.svg',
        status: 'Good',
      };
    } else {
      return {
        gradient: 'from-red-100',
        icon: '/icons/ats-bad.svg',
        status: 'Needs Improvement',
      };
    }
  };

  const styles = getStyles();

  return (
    <div className={`bg-gradient-to-r ${styles.gradient} to-transparent rounded-2xl shadow-md p-8 w-full`}>
      {/* Top Section */}
      <div className='flex flex-row items-start gap-6 mb-6'>
        <img src={styles.icon} alt="ATS Status" className='w-16 h-16' />
        <div>
          <h2 className='text-3xl font-bold text-gray-800'>
            ATS Score - {score}/100
          </h2>
          <p className='text-sm text-gray-600 mt-1'>{styles.status}</p>
        </div>
      </div>

      {/* Description Section */}
      <div className='mb-6'>
        <h3 className='text-xl font-semibold text-gray-800 mb-2'>
          Resume Optimization Tips
        </h3>
        <p className='text-gray-600 text-sm mb-4'>
          Here are actionable suggestions to improve your resume's ATS compatibility and overall impact.
        </p>
      </div>

      {/* Suggestions List */}
      <div className='space-y-3 mb-6'>
        {suggestions.map((suggestion, index) => (
          <div key={index} className='flex flex-row items-start gap-3'>
            <img
              src={suggestion.type === 'good' ? '/icons/check.svg' : '/icons/warning.svg'}
              alt={suggestion.type}
              className='w-5 h-5 mt-0.5 flex-shrink-0'
            />
            <p className='text-gray-700 text-sm'>
              {suggestion.tip}
            </p>
          </div>
        ))}
      </div>

      {/* Closing Line */}
      <div className='border-t border-gray-300 pt-4'>
        <p className='text-sm text-gray-700 font-medium'>
          ✨ Keep improving! Small changes can make a big difference in getting noticed by recruiters.
        </p>
      </div>
    </div>
  );
};

export default ATS;
