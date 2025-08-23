import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ScriptAnalysisResult } from '@/lib/ai/types/analysis';

// Register fonts if needed
// Font.register({ family: 'Roboto', src: '/fonts/Roboto-Regular.ttf' });
// Font.register({ family: 'Roboto-Bold', src: '/fonts/Roboto-Bold.ttf' });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e40af',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4,
  },
  metricContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  metric: {
    width: '48%',
    marginBottom: 10,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  text: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#334155',
    marginBottom: 8,
  },
  list: {
    marginLeft: 15,
  },
  listItem: {
    fontSize: 11,
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#9ca3af',
  },
});

interface PDFReportProps {
  analysis: ScriptAnalysisResult;
  title?: string;
  author?: string;
}

const PDFReport: React.FC<PDFReportProps> = ({ 
  analysis, 
  title = 'Script Analysis Report',
  author = 'ScriptIQ'
}) => {
  const currentDate = format(new Date(), 'MMMM d, yyyy');
  
  // Helper to format metrics
  const formatMetric = (value: any, suffix: string = '') => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'number' && Number.isInteger(value)) return value.toLocaleString();
    if (typeof value === 'number') return value.toFixed(2);
    return `${value}${suffix}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Generated on {currentDate} by {author}</Text>
          {analysis.metrics.scriptTitle && (
            <Text style={styles.subtitle}>
              Script: {analysis.metrics.scriptTitle}
            </Text>
          )}
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={styles.text}>
            {analysis.summary || 'No summary available.'}
          </Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricContainer}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Scene Count</Text>
              <Text style={styles.metricValue}>
                {formatMetric(analysis.metrics.sceneCount)}
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Characters</Text>
              <Text style={styles.metricValue}>
                {formatMetric(analysis.metrics.characterCount)}
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Avg. Dialogue Length</Text>
              <Text style={styles.metricValue}>
                {formatMetric(analysis.metrics.averageDialogueLength, ' words')}
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Reading Ease</Text>
              <Text style={styles.metricValue}>
                {formatMetric(analysis.metrics.fleschReadingEase, '/100')}
              </Text>
            </View>
          </View>
        </View>

        {/* Strengths */}
        {analysis.strengths && analysis.strengths.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Strengths</Text>
            <View style={styles.list}>
              {analysis.strengths.map((strength, index) => (
                <Text key={index} style={styles.listItem}>• {strength}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Suggestions */}
        {analysis.suggestions && analysis.suggestions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggestions for Improvement</Text>
            <View style={styles.list}>
              {analysis.suggestions.map((suggestion, index) => (
                <Text key={index} style={styles.listItem}>• {suggestion}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Formatting Issues */}
        {analysis.metrics.formatErrors && analysis.metrics.formatErrors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Formatting Issues</Text>
            <Text style={styles.text}>
              {analysis.metrics.formatErrors.length} potential formatting issues found. Here are the most critical ones:
            </Text>
            <View style={{ marginTop: 8 }}>
              {analysis.metrics.formatErrors.slice(0, 5).map((error, index) => (
                <View key={index} style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
                    Line {error.lineNumber}: {error.type}
                  </Text>
                  <Text style={{ fontSize: 10, color: '#ef4444' }}>
                    {error.message}
                  </Text>
                  <Text style={{ fontSize: 9, color: '#6b7280', fontStyle: 'italic' }}>
                    {error.context}
                  </Text>
                </View>
              ))}
              {analysis.metrics.formatErrors.length > 5 && (
                <Text style={{ fontSize: 9, color: '#6b7280', marginTop: 4 }}>
                  +{analysis.metrics.formatErrors.length - 5} more issues found
                </Text>
              )}
            </View>
          </View>
        )}

        <Text style={styles.footer}>
          Generated by ScriptGenius - Professional Script Analysis Tool
        </Text>
        <Text 
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => (
            `Page ${pageNumber} of ${totalPages}`
          )}
          fixed
        />
      </Page>
    </Document>
  );
};

export default PDFReport;
