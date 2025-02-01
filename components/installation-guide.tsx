import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

import {useToast } from '@/hooks/use-toast'
export function InstallationGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Installation Guide</CardTitle>
        <CardDescription>Follow these steps to integrate PassProve into your e-shop</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="modal">Modal Window</TabsTrigger>
            <TabsTrigger value="sdk">SDK/Plugin</TabsTrigger>
          </TabsList>
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Integration</CardTitle>
                <CardDescription>Integrate PassProve using our RESTful API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Sign up for a PassProve account and obtain your API key</li>
                  <li>Install the PassProve client library for your programming language</li>
                  <li>Initialize the PassProve client with your API key</li>
                  <li>Implement age verification checks in your e-shop&apos;s checkout process</li>
                  <li>Handle the verification response and proceed accordingly</li>
                </ol>
                <Button>View API Documentation</Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="modal">
            <Card>
              <CardHeader>
                <CardTitle>Modal Window Integration</CardTitle>
                <CardDescription>Add PassProve as a modal window in your e-shop</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Include the PassProve JavaScript library in your website</li>
                  <li>Configure the PassProve settings in your site&apos;s JavaScript</li>
                  <li>Add a trigger button or event to open the PassProve modal</li>
                  <li>Implement the callback function to handle verification results</li>
                  <li>Style the modal to match your e-shop&apos;s design (optional)</li>
                </ol>
                <Button>View Modal Integration Guide</Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sdk">
            <Card>
              <CardHeader>
                <CardTitle>SDK/Plugin Integration</CardTitle>
                <CardDescription>Use our SDK or plugin for popular e-commerce platforms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Choose the appropriate SDK or plugin for your e-commerce platform</li>
                  <li>Install the SDK or plugin following the platform-specific instructions</li>
                  <li>Configure the PassProve settings in your platform&apos;s admin panel</li>
                  <li>Set up age verification rules for your products or categories</li>
                  <li>Test the integration to ensure it&apos;s working correctly</li>
                </ol>
                <Button>View SDK/Plugin Documentation</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

