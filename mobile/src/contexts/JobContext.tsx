import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/**
 * Job Types and Interfaces
 */
export type JobStatus = 'idle' | 'running' | 'completed' | 'failed';
export type JobType = 'analysis' | 'generation';

export interface ActiveJob {
    id: string;
    type: JobType;
    title: string;
    status: JobStatus;
    progress?: string;
    result?: any;
    error?: string;
    targetScreen?: string;
    params?: any;
}

interface JobContextType {
    activeJob: ActiveJob | null;
    startJob: (job: Omit<ActiveJob, 'status' | 'id'>) => string;
    updateJob: (id: string, updates: Partial<ActiveJob>) => void;
    clearJob: () => void;
    finishJob: (id: string, result: any) => void;
    failJob: (id: string, error: string) => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);

    const startJob = useCallback((job: Omit<ActiveJob, 'status' | 'id'>) => {
        const id = `job_${Date.now()}`;
        setActiveJob({
            ...job,
            id,
            status: 'running'
        });
        return id;
    }, []);

    const updateJob = useCallback((id: string, updates: Partial<ActiveJob>) => {
        setActiveJob(prev => {
            if (prev?.id === id) {
                return { ...prev, ...updates };
            }
            return prev;
        });
    }, []);

    const finishJob = useCallback((id: string, result: any) => {
        setActiveJob(prev => {
            if (prev?.id === id) {
                return {
                    ...prev,
                    status: 'completed',
                    result,
                    progress: 'Complete'
                };
            }
            return prev;
        });
    }, []);

    const failJob = useCallback((id: string, error: string) => {
        setActiveJob(prev => {
            if (prev?.id === id) {
                return {
                    ...prev,
                    status: 'failed',
                    error,
                    progress: 'Failed'
                };
            }
            return prev;
        });
    }, []);

    const clearJob = useCallback(() => {
        setActiveJob(null);
    }, []);

    return (
        <JobContext.Provider value={{
            activeJob,
            startJob,
            updateJob,
            clearJob,
            finishJob,
            failJob
        }}>
            {children}
        </JobContext.Provider>
    );
};

export const useJobs = () => {
    const context = useContext(JobContext);
    if (context === undefined) {
        throw new Error('useJobs must be used within a JobProvider');
    }
    return context;
};
