"use client"
import React, { useContext, useState } from 'react'
import FormSection from '../_components/FormSection'
import OutputSection from '../_components/OutputSection'
import { TEMPLATE } from '../../_components/TemplateListSection'
import Templates from '@/app/(data)/Templates'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { chatSession } from '@/utils/AiModal'
import { db } from '@/utils/db'
import { AIOutput } from '@/utils/schema'

import moment from 'moment'
import { TotalUsageContext } from '@/app/(context)/TotalUsageContext'
import { useRouter } from 'next/navigation'
import { UserSubscriptionContext } from '@/app/(context)/UserSubscriptionContext'
import { UpdateCreditUsageContext } from '@/app/(context)/UpdateCreditUsageContext'
import { useUser } from '@clerk/nextjs'

interface PROPS{
    params:{
        'template-slug':string
    }
}

function CreateNewContent(props:PROPS) {
   
    const selectedTemplate:TEMPLATE|undefined=Templates?.find((item)=>item.slug==props.params['template-slug']);
    const [loading,setLoading]=useState(false);
    const [aiOutput,setAiOutput]=useState<string>('');
    const {user}=useUser();
    const router=useRouter();
    const {totalUsage,setTotalUsage}=useContext(TotalUsageContext)
    const {userSubscription,setUserSubscription}=useContext(UserSubscriptionContext);
    const {updateCreditUsage,setUpdateCreditUsage}=useContext(UpdateCreditUsageContext)
    /**
     * Used to generate content from AI
     * @param formData 
     * @returns 
     */
    // Function to clean RTF formatting from AI response
    const cleanRTFText = (text: string): string => {
        if (!text) return '';
        
        let cleaned = text;
        
        // Remove RTF code blocks
        cleaned = cleaned.replace(/```rtf\s*\{[\s\S]*?\}\s*```/g, '');
        cleaned = cleaned.replace(/```rtf\s*([\s\S]*?)\s*```/g, '$1');
        
        // Remove RTF document structure
        cleaned = cleaned.replace(/\{\\rtf1\\ansi[\s\S]*?\}/g, '');
        cleaned = cleaned.replace(/\\rtf1\\ansi[\s\S]*?\{/g, '');
        
        // Remove RTF control words and groups
        cleaned = cleaned.replace(/\\[a-z]+\d*\s?/g, '');
        cleaned = cleaned.replace(/\{[^}]*\}/g, '');
        cleaned = cleaned.replace(/\\par\s?/g, '\n');
        cleaned = cleaned.replace(/\\line\s?/g, '\n');
        
        // Remove font and formatting commands
        cleaned = cleaned.replace(/\\f\d+\s?/g, '');
        cleaned = cleaned.replace(/\\fs\d+\s?/g, '');
        cleaned = cleaned.replace(/\\cf\d+\s?/g, '');
        cleaned = cleaned.replace(/\\cb\d+\s?/g, '');
        
        // Clean up extra whitespace and normalize line breaks
        cleaned = cleaned.replace(/\s+/g, ' ');
        cleaned = cleaned.replace(/\n\s*\n/g, '\n');
        cleaned = cleaned.trim();
        
        return cleaned;
    };

    const GenerateAIContent=async(formData:any)=>{
        if(totalUsage>=10000000&&!userSubscription)//10000 testnow
            {
                console.log("Please Upgrade");
                router.push('/dashboard/billing')
                return ;
            }
        setLoading(true);
        const SelectedPrompt=selectedTemplate?.aiPrompt;
        const FinalAIPrompt=JSON.stringify(formData)+", "+SelectedPrompt;
        const result=await chatSession.sendMessage(FinalAIPrompt);
        
        const rawResponse = result?.response.text();
        console.log('Raw AI Response:', rawResponse);
        
        const cleanedResponse = (rawResponse);//cleanRTFText
        console.log('Cleaned AI Response:', cleanedResponse);
        
        setAiOutput(cleanedResponse);
        await SaveInDb(JSON.stringify(formData),selectedTemplate?.slug,cleanedResponse)
        setLoading(false);
        
        setUpdateCreditUsage(Date.now())

    }

    const SaveInDb=async(formData:any,slug:any,aiResp:string)=>{
        const result=await db.insert(AIOutput).values({
            formData:formData,
            templateSlug:slug,
            aiResponse:aiResp,
            createdBy:user?.primaryEmailAddress?.emailAddress,
            createdAt:moment().format('DD/MM/yyyy'),
        });

        console.log(result);
    }
    

  return (
    <div className='p-5'>
        <Link href={"/dashboard"}>
            <Button> <ArrowLeft/> Back</Button>
        </Link>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-5 py-5 '>
            {/* FormSection  */}
                <FormSection 
                selectedTemplate={selectedTemplate}
                userFormInput={(v:any)=>GenerateAIContent(v)}
                loading={loading} />
            {/* OutputSection  */}
            <div className='col-span-2'>
                <OutputSection aiOutput={aiOutput} />
                </div>
        </div>
    </div>
  )
}

export default CreateNewContent