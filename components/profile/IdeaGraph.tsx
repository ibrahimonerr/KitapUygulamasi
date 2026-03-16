import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { FONTS, SPACING } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useLibrary } from '../../store/LibraryContext';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  useSharedValue,
  FadeIn,
  FadeOut,
  SlideInUp
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Line } from 'react-native-svg';
import { generateIdeaGraphData, GraphNode, GraphLink } from '../../services/graphService';
import { BlurView } from 'expo-blur';
import { FONTS, SPACING } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useLibrary } from '../../store/LibraryContext';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  useSharedValue,
  FadeIn,
  FadeOut,
  SlideInUp
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const GRAPH_HEIGHT = height * 0.6;

import { analyzeContentWithAI } from '../../services/ai';

const IdeaNode = ({ node, isSelected, onPress }: { node: GraphNode, isSelected: boolean, onPress: () => void }) => {
  const translateY = useSharedValue(0);
  const { colors } = useTheme();
  
  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 3000 + Math.random() * 2000 }),
        withTiming(5, { duration: 3000 + Math.random() * 2000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: withTiming(isSelected ? 1.2 : 1) }
    ],
  }));

  return (
    <Animated.View 
      style={[
        styles.nodeContainer, 
        { top: node.y, left: node.x },
        animatedStyle
      ]}
    >
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        style={[
          styles.nodeCapsule, 
          { 
            backgroundColor: isSelected ? colors.primary : colors.highlight,
            borderColor: isSelected ? '#FFF' : colors.primary,
            borderWidth: isSelected ? 2 : 1,
            opacity: isSelected ? 1 : 0.8,
          }
        ]}
      >
        <Text style={[
          styles.nodeText, 
          { 
            fontSize: 12,
            color: isSelected ? '#FFF' : colors.primary
          }
        ]} numberOfLines={2}>
          {node.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function IdeaGraph() {
  const { colors, isDark } = useTheme();
  const { activeBooks, finishedBooks } = useLibrary();
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    loadGraphData();
  }, [activeBooks.length, finishedBooks.length]);

  const loadGraphData = async () => {
    const allBooks = [...activeBooks, ...finishedBooks];
    const allNotes = allBooks.flatMap(b => b.notes.map(n => ({ ...n, bookTitle: b.title })));
    const allQuotes = allBooks.flatMap(b => b.quotes.map(q => ({ ...q, bookTitle: b.title })));

    if (allNotes.length === 0 && allQuotes.length === 0) return;

    setIsLoading(true);
    try {
      const { nodes: rawNodes, links: rawLinks } = await generateIdeaGraphData(allNotes, allQuotes);
      
      // Position nodes randomly but within bounds
      const positionedNodes = rawNodes.map((node, i) => ({
        ...node,
        x: 40 + (Math.random() * (width - 150)),
        y: 40 + (Math.random() * (GRAPH_HEIGHT - 100))
      }));

      setNodes(positionedNodes);
      setLinks(rawLinks);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSourceNode = (id: string) => nodes.find(n => n.id === id);
  const getTargetNode = (id: string) => nodes.find(n => n.id === id);

  return (
    <View style={styles.container}>
      <View style={[styles.graphArea, { height: GRAPH_HEIGHT }]}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={[styles.loadingText, { color: colors.text }]}>Fikirlerin Bağlanıyor...</Text>
          </View>
        )}

        <Svg style={StyleSheet.absoluteFill}>
          {links.map((link, i) => {
            const source = getSourceNode(link.source);
            const target = getTargetNode(link.target);
            if (!source || !target) return null;
            
            return (
              <Line
                key={i}
                x1={source.x! + 40}
                y1={source.y! + 20}
                x2={target.x! + 40}
                y2={target.y! + 20}
                stroke={colors.primary}
                strokeWidth={link.weight * 2}
                opacity={0.3}
              />
            );
          })}
        </Svg>

        {nodes.map(node => (
          <IdeaNode 
            key={node.id}
            node={node}
            isSelected={selectedNode?.id === node.id}
            onPress={() => setSelectedNode(node)}
          />
        ))}

        {selectedNode && (
          <Animated.View 
            entering={SlideInUp.duration(400)}
            exiting={FadeOut}
            style={styles.detailCard}
          >
            <BlurView intensity={95} tint={isDark ? 'dark' : 'light'} style={styles.detailBlur}>
              <View style={styles.detailHeader}>
                <View style={[styles.detailBadge, { backgroundColor: colors.primary }]}>
                  <Ionicons name="bulb-outline" size={14} color="#FFF" />
                  <Text style={styles.detailBadgeText}>SEÇİLİ FİKİR</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedNode(null)}>
                  <Ionicons name="close-circle" size={28} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.detailTitle, { color: colors.text }]} numberOfLines={3}>
                {selectedNode.label}
              </Text>
              
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              <Text style={[styles.relatedTitle, { color: colors.text }]}>Anlamsal Bağlar</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {links.filter(l => l.source === selectedNode.id || l.target === selectedNode.id).map((link, i) => {
                  const otherId = link.source === selectedNode.id ? link.target : link.source;
                  const otherNode = nodes.find(n => n.id === otherId);
                  return (
                    <View key={i} style={[styles.linkItem, { borderColor: colors.border }]}>
                      <Text style={[styles.linkLabel, { color: colors.primary }]}>{link.label}</Text>
                      <Text style={[styles.linkTarget, { color: colors.textMuted }]} numberOfLines={2}>
                        {otherNode?.label}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </BlurView>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  graphArea: {
    flex: 1,
    position: 'relative',
  },
  nodeContainer: {
    position: 'absolute',
    borderRadius: 30,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 5,
  },
  nodeCapsule: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 140,
  },
  nodeText: {
    fontFamily: FONTS.primary.bold,
    textAlign: 'center',
    fontSize: 11,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  linkItem: {
    padding: SPACING.m,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: SPACING.s,
  },
  linkLabel: {
    fontFamily: FONTS.primary.bold,
    fontSize: 12,
    marginBottom: 2,
  },
  linkTarget: {
    fontFamily: FONTS.primary.regular,
    fontSize: 12,
  },
  detailCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.45,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
    zIndex: 100,
  },
  detailBlur: {
    flex: 1,
    padding: SPACING.xl,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: FONTS.primary.bold,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  detailTitle: {
    fontFamily: FONTS.primary.bold,
    fontSize: 24,
    marginBottom: SPACING.s,
  },
  detailDescription: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.l,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: SPACING.l,
    opacity: 0.1,
  },
  relatedTitle: {
    fontFamily: FONTS.primary.bold,
    fontSize: 16,
    marginBottom: SPACING.m,
  },
  quoteScroll: {
    flex: 1,
  },
  quoteItem: {
    paddingLeft: SPACING.m,
    borderLeftWidth: 3,
    marginBottom: SPACING.l,
  },
  quoteText: {
    fontFamily: FONTS.primary.regular,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 4,
  },
  quoteBook: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 12,
  },
  noContentText: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: SPACING.m,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 16,
    marginTop: SPACING.m,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontFamily: FONTS.primary.regular,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
